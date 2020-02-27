/*
 * moleculer-apollo-server
 *
 * Apollo Server for Moleculer API Gateway.
 *
 * Based on "apollo-server-micro"
 *
 * 		https://github.com/apollographql/apollo-server/blob/master/packages/apollo-server-micro/
 *
 *
 * Copyright (c) 2020 MoleculerJS (https://github.com/moleculerjs/moleculer-apollo-server)
 * MIT Licensed
 */

"use strict";

const core = require("apollo-server-core");
const { ApolloServer } = require("./src/ApolloServer");
const ApolloService = require("./src/service");
const gql = require("./src/gql");

module.exports = {
	// Core
	GraphQLUpload: core.GraphQLUpload,
	GraphQLExtension: core.GraphQLExtension,
	gql: core.gql,
	ApolloError: core.ApolloError,
	toApolloError: core.toApolloError,
	SyntaxError: core.SyntaxError,
	ValidationError: core.ValidationError,
	AuthenticationError: core.AuthenticationError,
	ForbiddenError: core.ForbiddenError,
	UserInputError: core.UserInputError,
	defaultPlaygroundOptions: core.defaultPlaygroundOptions,

	// GraphQL tools
	...require("graphql-tools"),

	// Apollo Server
	ApolloServer,

	// Apollo Moleculer Service
	ApolloService,

	// Moleculer gql formatter
	moleculerGql: gql,
};
