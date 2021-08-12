module.exports = {
    transpileDependencies: ['vuetify'],
    chainWebpack: (config) => {
        config.module
            .rule('fbx')
            .test(/\.fbx$/)
            .use('url-loader')
            .loader('url-loader?limit=100000');

        config.optimization.minimize(false);
    },
};
