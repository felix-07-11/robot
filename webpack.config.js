/* eslint-disable */

module: {
    rules: [
        {
            test: /\.(png|jpe?g|gif|jp2|webp)$/,
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
            },
        },
        {
            test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
            use: ['url-loader?limit=100000'],
        },
        {
            test: /\.fbx$/,
            loader: 'url-loader?limit=100000',
        },
    ]
}
