
const IDParser = require('./terminusIDParser');

function ConnectionConfig(params) {
	const newParams = params || {};
	this.server = false;
	this.dbid = false;
	this.docid = false;
	if (newParams.server) this.setServer(newParams.server);
	if (newParams.db) this.setDB(newParams.db);
	if (newParams.doc) this.setDocument(newParams.doc);
	/*
     * client configuration options - connected_mode = connected
     * tells the client to first connect to the server before invoking other services
     */

	this.connected_mode = newParams.connected_mode || 'connected';
	// include a terminus:user_key API key in the calls
	this.include_key = newParams.include_key || true;
	// client side checking of access control (in addition to server-side access control)
	this.client_checks_capabilities = newParams.client_checks_capabilities || true;
}

ConnectionConfig.prototype.serverURL = function () {
	return this.server;
};


ConnectionConfig.prototype.connectionMode = function () {
	return this.connected_mode === 'connected';
};

ConnectionConfig.prototype.includeKey = function () {
	return this.include_key === true;
};

ConnectionConfig.prototype.schemaURL = function () {
	return `${this.dbURL()}/schema`;
};
ConnectionConfig.prototype.queryURL = function () {
	return `${this.dbURL()}/woql`;
};
ConnectionConfig.prototype.frameURL = function () {
	return `${this.dbURL()}/frame`;
};
ConnectionConfig.prototype.docURL = function () {
	return `${this.dbURL()}/document/${this.docid ? this.docid : ''}`;
};

ConnectionConfig.prototype.dbURL = function (call) {
	// url swizzling to talk to platform using server/dbid/platform/ pattern..
	if (this.platformEndpoint()) {
		const baseURL = this.server.substring(0, this.server.lastIndexOf('/platform/'));

		if (!call || call !== 'create') {
			return `${baseURL}/${this.dbid}/platform`;
		} if (call === 'platform') {
			return `${baseURL}/${this.dbid}`;
		}
	}
	return this.server + this.dbid;
};

ConnectionConfig.prototype.platformEndpoint = function () {
	if (this.server && this.server.lastIndexOf('/platform/') === this.server.length - 10) {
		return true;
	}
	return false;
};

/**
 * Utility functions for setting and parsing urls and determining
 * the current server, database and document
 */
ConnectionConfig.prototype.setServer = function (inputStr, context) {
	const parser = new IDParser(context);
	if (parser.parseServerURL(inputStr)) {
		this.server = parser.server();
		this.dbid = false;
		this.docid = false;
		return true;
	}
	return false;
};

ConnectionConfig.prototype.setDB = function (inputStr, context) {
	const parser = new IDParser(context);
	if (parser.parseDBID(inputStr)) {
		if (parser.server()) this.server = parser.server();
		this.dbid = parser.dbid();
		this.docid = false;
		return true;
	}
	return false;
};

// @param {string} inputStr TerminusDB server URL or a valid TerminusDB Id or omitted

ConnectionConfig.prototype.setSchemaURL = function (inputStr, context) {
	const parser = new IDParser(context);
	if (parser.parseSchemaURL(inputStr)) {
		if (parser.server()) this.server = parser.server();
		this.dbid = parser.dbid();
		this.docid = false;
		return true;
	}
	return false;
};

ConnectionConfig.prototype.setDocument = function (inputStr, context) {
	const parser = new IDParser(context);
	if (parser.parseDocumentURL(inputStr)) {
		if (parser.server()) this.server = parser.server();
		if (parser.dbid()) this.dbid = parser.dbid();
		if (parser.docid()) this.docid = parser.docid();
		return true;
	}
	return false;
};

ConnectionConfig.prototype.setQueryURL = function (inputStr, context) {
	const parser = new IDParser(context);
	if (parser.parseQueryURL(inputStr)) {
		if (parser.server()) this.server = parser.server();
		this.dbid = parser.dbid();
		this.docid = false;
		return true;
	}
	return false;
};

ConnectionConfig.prototype.setClassFrameURL = function (inputStr, context) {
	const parser = new IDParser(context);
	if (parser.parseClassFrameURL(inputStr)) {
		if (parser.server()) this.server = parser.server();
		this.dbid = parser.dbid();
		this.docid = false;
		return true;
	}
	return false;
};

module.exports = ConnectionConfig;
