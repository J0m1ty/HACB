const path = require('path');

module.exports = [
    {
        name: 'server',
        entry: './src/server/index.ts',
        target: 'node',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        output: {
            path: __dirname + '/dist/server',
            filename: 'backend.js',
        },
        mode: "production",
    },
    {
        name: 'client',
        entry: './src/client/index.ts',
        target: 'web',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        output: {
            path: __dirname + '/dist/client',
            filename: 'bundle.js',
        },
        mode: "production",
    }
];