'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const crypto = require('crypto');
const axios = require('axios');

/**
 * Greenhouse promise request.
 * @param apiToken string.
 */
const getJobs = apiToken => axios.get('https://harvest.greenhouse.io/v1/job_posts', {
	params: {
		live: true
	},
	auth: {
		username: apiToken,
		password: ''
	}
});

/**
 * Gatsby requires ID to be a string to define nodes and greenhouse.io uses an integer instead.
 *
 * @param obj object.
 * @returns object.
 */
const changeId = obj => {
	const updatedObj = obj;
	updatedObj.id = updatedObj.id.toString();
	return updatedObj;
};

exports.sourceNodes = (() => {
	var _ref = _asyncToGenerator(function* ({ boundActionCreators }, { apiToken }) {
		const createNode = boundActionCreators.createNode;


		const result = yield getJobs(apiToken);
		const jobs = result.data;

		jobs.forEach(function (job) {
			const jsonString = JSON.stringify(job);
			const gatsbyNode = _extends({}, changeId(job), {
				children: [],
				parent: '__SOURCE__',
				internal: {
					type: 'GreenhouseJob',
					content: jsonString,
					contentDigest: crypto.createHash('md5').update(jsonString).digest('hex')
				}
			});
			createNode(gatsbyNode);
		});
	});

	return function (_x, _x2) {
		return _ref.apply(this, arguments);
	};
})();