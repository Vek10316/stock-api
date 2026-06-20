import express from 'express';
import cors from 'cors';
import stockRoutes from './modules/stock/stock.routes';
import supplierRoutes from './modules/clients/supplier/supplier.routes';
import buyerRoutes from './modules/clients/buyer/buyer.routes';
import purchasesRoutes from './modules/transactions/purchases/purchases.routes';
import salesRoutes from './modules/transactions/sales/sales.routes';
import transactionSettingsRoutes from './modules/transactions/settings/transaction-settings.routes';
import apiCallTestRoutes from './modules/generalTests/apiCallTest';
import exportDataRoutes from './modules/exportData/export-data.routes';
import generateReportRoutes from './modules/reports/generate-reports.route';
import 'dotenv/config';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/stock/', stockRoutes);
app.use('/api/suppliers/', supplierRoutes);
app.use('/api/buyers/', buyerRoutes);
app.use('/api/purchases/', purchasesRoutes);
app.use('/api/sales/', salesRoutes);
app.use('/api/transaction-settings/', transactionSettingsRoutes);
app.use('/api/test/', apiCallTestRoutes);
app.use('/api/export/', exportDataRoutes);
app.use('/api/reports/', generateReportRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Stock Management API!');
});

export default app;