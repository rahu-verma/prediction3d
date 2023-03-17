var path = require('path');
var webpack = require('webpack');
var CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
    mode:'production',
    entry: [
        "@babel/polyfill",
        path.join(__dirname, '../src/index.js'),
        //"../src/index.js",
    ],
    output: {
        path: path.join(__dirname, '../public/build/'),
        filename: 'bundle.js',
        publicPath: "/"
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    plugins: [
        new webpack.optimize.AggressiveMergingPlugin(), //Merge chunks
        new CompressionPlugin({
            filename: "[path].gz[query]",
            algorithm: "gzip",
            test: /\.js$|\.css$|\.html$/,
            threshold: 10240,
            minRatio: 0.8
        })
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                include: [
                    path.join(__dirname, '../src'),
                    path.join(__dirname, '../Data')
                ],
                use: {
                    loader:'babel-loader',
                    options:{
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        plugins: ['@babel/plugin-proposal-class-properties']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.png$/, use: "url-loader?limit=100000"
            },
            {
                test: /\.jpg$/, use: "file-loader"
            }
        ]
    },
    target: "webworker",
    externals: [
      "child_process",
      "dns",
      "fs",
      "net",
      "tls",
      "tedious",
      "pg-hstore",
    ]
};
