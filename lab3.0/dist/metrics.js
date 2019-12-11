"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var leveldb_1 = require("./leveldb");
var level_ws_1 = __importDefault(require("level-ws"));
var Metric = /** @class */ (function () {
    function Metric(ts, v) {
        this.timestamp = ts;
        this.value = v;
    }
    return Metric;
}());
exports.Metric = Metric;
var MetricsHandler = /** @class */ (function () {
    function MetricsHandler(dbPath) {
        this.db = leveldb_1.LevelDB.open(dbPath);
    }
    MetricsHandler.prototype.save = function (key, metrics, callback) {
        var stream = level_ws_1.default(this.db);
        stream.on('error', callback);
        stream.on('close', callback);
        metrics.forEach(function (m) {
            stream.write({ key: "metric:" + key + m.timestamp, value: m.value });
        });
        stream.end();
    };
    MetricsHandler.prototype.getAll = function (callback) {
        var metrics = [];
        this.db.createReadStream()
            .on('data', function (data) {
            var oneMetric = new Metric(data.key, data.value);
            metrics.push(oneMetric);
            console.log(data.key, '=', data.value);
            //callback(null, data) we will retrive data metrics with the callback in "end" !!
        }) // if i put this callback then we have 2 setheaders leading to error !
            .on('error', function (err) {
            console.log('Oh my!', err);
            callback(err, err); // 
        })
            .on('close', function () {
            console.log('Stream closed');
        })
            .on('end', function () {
            console.log('Stream ended');
            callback(null, metrics);
        });
    };
    MetricsHandler.prototype.getOne = function (key, callback) {
        var metrics = [];
        this.db.createReadStream()
            .on('data', function (data) {
            if (data.key == key) {
                var oneMetric = new Metric(data.key, data.value);
                // trouver une methode pour afficher qu'un seul metric
                metrics.push(oneMetric);
                console.log(data.key, '=', data.value);
            }
        })
            .on('error', function (err) {
            console.log('Oh my!', err);
            callback(err, err); // 
        })
            .on('close', function () {
            console.log('Stream closed');
        })
            .on('end', function () {
            console.log('Stream ended');
            callback(null, metrics);
        });
    };
    MetricsHandler.prototype.delOne = function (key, callback) {
        this.db.del(key, callback(null));
    };
    MetricsHandler.get = function (callback) {
        var result = [
            new Metric('2013-11-04 14:00 UTC', 12),
            new Metric('2013-11-04 14:30 UTC', 15)
        ];
        callback(null, result);
    };
    return MetricsHandler;
}());
exports.MetricsHandler = MetricsHandler;
