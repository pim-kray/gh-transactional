"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initState = initState;
exports.loadState = loadState;
exports.saveState = saveState;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function initState(statePath, transactionId) {
    // Ensure the parent directory exists
    const dir = path_1.default.dirname(statePath);
    fs_1.default.mkdirSync(dir, { recursive: true });
    // Create initial state object
    const initialState = {
        transactionId,
        status: "RUNNING",
        steps: [],
    };
    // Write state to file as formatted JSON
    fs_1.default.writeFileSync(statePath, JSON.stringify(initialState, null, 2));
}
function loadState(statePath) {
    return JSON.parse(fs_1.default.readFileSync(statePath, "utf8"));
}
function saveState(statePath, state) {
    fs_1.default.writeFileSync(statePath, JSON.stringify(state, null, 2));
}
