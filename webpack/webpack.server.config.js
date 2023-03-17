var path = require('path');
var webpack = require('webpack');

module.exports = {
    devtool: 'eval',
    entry: [
        'babel-polyfill',
        path.join(__dirname, '../public/babel.server.js'),
        //"../src/index.js"
    ],
    output: {
        path: path.join(__dirname, '../public/build/'),
        filename: 'server.bundle.js',
        publicPath: '/build/'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin()
    ],
    resolve: {
        extensions: ['.js', '.jsx']
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                loaders: ['react-hot-loader/webpack', 'babel-loader'],
                include: path.join(__dirname, '../public/js'),
                exclude: /(node_modules|bower_components)/,
            },
             {
                 test: /\.css$/, loader: "style-loader!css-loader"
             },
             {
                 test: /\.png$/, loader: "url-loader?limit=100000"
             },
             {
                 test: /\.jpg$/, loader: "file-loader"
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
