module.exports = {
	apps: [
		{
			name: "stations",
			script: "index.js",
			env: {
				NODE_ENV: "production",
				PORT: 3001,
				APP_VERSION: "2.1.0",
				JWT_SECRET: "this-is-my-secret-jwt-word-بالعربي",
				JWT_EXPIRES_IN: "3d",
				BASE_URL: "/api/v1/",
				YEAR: "2026",
			},
		},
	],
};
