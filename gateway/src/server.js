import express from "express";
import { createProxyMiddleware }
from "http-proxy-middleware";

const app = express();

app.use(
 "/auth",
 createProxyMiddleware({
   target:"http://auth:3001",
   changeOrigin:true
 })
);

app.use(
 "/productos",
 createProxyMiddleware({
   target:"http://productos:3002",
   changeOrigin:true
 })
);

app.listen(3000);