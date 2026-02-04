const { docClient, s3Client } = require('../config/aws');
const { ScanCommand, PutCommand, DeleteCommand, GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;
const BUCKET_NAME = process.env.S3_BUCKET_NAME;

const getAllProducts = async (req, res) => {
    try {
        const command = new ScanCommand({
            TableName: TABLE_NAME
        });
        const response = await docClient.send(command);
        res.render('index', { products: response.Items });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Error fetching products");
    }
};

const getAddProductPage = (req, res) => {
    res.render('add');
};

const createProduct = async (req, res) => {
    const { name, price, quantity } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).send("Please upload an image");
    }

    const imageKey = `${uuidv4()}-${file.originalname}`;
    
    try {
        // Upload image to S3
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: imageKey,
            Body: file.buffer,
            ContentType: file.mimetype
        }));

        const imageUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`;
        const productId = uuidv4();

        // Save to DynamoDB
        await docClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                id: productId,
                name,
                price: Number(price),
                quantity: Number(quantity),
                url_image: imageUrl,
                image_key: imageKey // Store key for deletion
            }
        }));

        res.redirect('/');
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).send("Error creating product");
    }
};

const getEditProductPage = async (req, res) => {
    const { id } = req.params;
    try {
        const command = new GetCommand({
            TableName: TABLE_NAME,
            Key: { id }
        });
        const response = await docClient.send(command);
        
        if (!response.Item) {
            return res.status(404).send("Product not found");
        }
        
        res.render('edit', { product: response.Item });
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).send("Error fetching product");
    }
};

const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, quantity, old_image_key, old_image_url } = req.body;
    const file = req.file;

    let imageUrl = old_image_url;
    let imageKey = old_image_key;

    try {
        if (file) {
            // Delete old image if exists
            if (old_image_key) {
                await s3Client.send(new DeleteObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: old_image_key
                }));
            }

            // Upload new image
            imageKey = `${uuidv4()}-${file.originalname}`;
            await s3Client.send(new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: imageKey,
                Body: file.buffer,
                ContentType: file.mimetype
            }));
            imageUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${imageKey}`;
        }

        // Update DynamoDB
        await docClient.send(new UpdateCommand({
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression: "set #n = :n, price = :p, quantity = :q, url_image = :u, image_key = :k",
            ExpressionAttributeNames: { "#n": "name" },
            ExpressionAttributeValues: {
                ":n": name,
                ":p": Number(price),
                ":q": Number(quantity),
                ":u": imageUrl,
                ":k": imageKey
            }
        }));

        res.redirect('/');
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send("Error updating product");
    }
};

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    
    try {
        // Get product to find image key
        const getCommand = new GetCommand({
            TableName: TABLE_NAME,
            Key: { id }
        });
        const itemResponse = await docClient.send(getCommand);
        const product = itemResponse.Item;

        if (product && product.image_key) {
            // Delete image from S3
            await s3Client.send(new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: product.image_key
            }));
        }

        // Delete from DynamoDB
        await docClient.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { id }
        }));

        res.redirect('/');
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).send("Error deleting product");
    }
};

module.exports = {
    getAllProducts,
    getAddProductPage,
    createProduct,
    getEditProductPage,
    updateProduct,
    deleteProduct
};
