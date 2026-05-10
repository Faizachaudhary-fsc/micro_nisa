const express=require("express");
let db=require("./sql_connect");
const productRoutes=require("./routes/web/productRoutes");
const authRoutes = require('./routes/web/authRoutes');
const cartRoutes=require("./routes/web/cartRoutes");
const orderRoutes=require("./routes/web/orderRoutes");
require("dotenv").config();
const cors=require("cors");
let app=express();



app.use(cors());
app.use(express.json());
app.use("/api",productRoutes);
app.use('/api', authRoutes);
app.use("/api", cartRoutes);
app.use("/api",orderRoutes);


app.listen(5000,()=>{
    console.log(`Server is running on port 5000`);
});