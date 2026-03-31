"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = __importDefault(require("./routes/auth"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("./utils/logger");
const diagrams_routes_1 = __importDefault(require("./routes/diagrams.routes"));
const departments_routes_1 = __importDefault(require("./routes/departments.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const reports_routes_1 = __importDefault(require("./routes/reports.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const workers_1 = require("./workers");
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || '3000', 10);
// Load Swagger YAML file
const swaggerDocument = yamljs_1.default.load(path_1.default.join(__dirname, '../swagger.yaml'));
// Note: If running via ts-node from root, use './swagger.yaml'
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Sometimes needed to allow Swagger UI to load correctly
}));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use(logger_1.requestLogger);
app.use('/api/diagrams', diagrams_routes_1.default);
app.use('/api/departments', departments_routes_1.default);
app.use('/api/users', users_routes_1.default);
app.use('/api/reports', reports_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
// Swagger Route
app.use('/api/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
app.use('/api/auth', auth_1.default);
// ----- Health Check -----
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use((err, req, res, _next) => {
    req.log?.error({ err }, 'Unhandled error');
    if (err.code === 'P2025') {
        res.status(404).json({ error: 'NOT_FOUND', message: 'Record not found' });
        return;
    }
    if (err.code === 'P2002') {
        const target = err.meta?.target;
        res.status(409).json({
            error: 'DUPLICATE',
            message: `A record with this ${target?.join(', ') || 'value'} already exists`,
        });
        return;
    }
    res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    });
});
process.on('unhandledRejection', (reason) => {
    logger_1.logger.error({ reason }, 'Unhandled promise rejection');
});
process.on('uncaughtException', (err) => {
    logger_1.logger.fatal({ err }, 'Uncaught exception');
    process.exit(1);
});
app.listen(PORT, () => {
    logger_1.logger.info(`Backend running on http://localhost:${PORT}`);
    if (process.env.DISABLE_WORKERS !== 'true')
        (0, workers_1.startAllWorkers)();
});
exports.default = app;
