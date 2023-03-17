var path = require('path');
var webpack = require('webpack');

module.exports = {
    devtool:'source-map',
    mode:'development',
    entry: [
        "@babel/polyfill",
        path.join(__dirname, '../src/index.js'),
        //"../src/index.js",
    ],
    output: {
        filename:'./public/build/bundle.js'
    },
    devServer: {
        publicPath: "/",
        contentBase: path.join(__dirname, '../public'),
        hot: true,
        historyApiFallback: true,
        proxy: {
            '/api/**': {
                target: 'http://localhost:5000',
                changeOrigin: true
            }
        }
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    plugins: [
        new webpack.ProgressPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                include: path.join(__dirname, '../src'),
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        plugins: ['@babel/plugin-proposal-class-properties']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            }
        ],
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
}
