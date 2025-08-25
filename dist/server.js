"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const PORT = env_1.config.server.port;
app_1.default.listen(PORT, () => {
    console.log(`🚀 User Service running on port ${PORT}`);
}).on('error', (error) => {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
});
//# sourceMappingURL=server.js.map