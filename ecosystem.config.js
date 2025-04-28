module.exports = {
	apps: [
		{
			name: "stations-api",
			script: "index.js",
			env: {
				NODE_ENV: "production",
				PORT: 8060,
				APP_VERSION: "1.1.0",
				JWT_SECRET: "this-is-my-secret-jwt-word-بالعربي",
				JWT_EXPIRES_IN: "90d",
				BASE_URL: "/api/v1/",
			},
		},
	],
};
