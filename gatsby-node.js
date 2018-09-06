'use strict';

/**
 * Greenhouse promise request.
 * @param apiToken string.
 * @param queryParams object.
 */
let getJobsForDepartment = (() => {
	var _ref = _asyncToGenerator(function* (apiToken, queryParams) {
		console.log(`Getting jobs for department id ${queryParams.departmentId}`);
		return axios.get('https://harvest.greenhouse.io/v1/jobs', {
			params: {
				department_id: queryParams.departmentId,
				status: 'open'
			},
			auth: {
				username: apiToken,
				password: ''
			}
		});
	});

	return function getJobsForDepartment(_x, _x2) {
		return _ref.apply(this, arguments);
	};
})();

/**
 * Greenhouse promise request.
 * @param apiToken string.
 * @param queryParams object.
 */


let getJobPostings = (() => {
	var _ref2 = _asyncToGenerator(function* (apiToken, queryParams = { live: true }) {
		return axios.get('https://harvest.greenhouse.io/v1/job_posts', {
			params: queryParams,
			auth: {
				username: apiToken,
				password: ''
			}
		});
	});

	return function getJobPostings(_x3) {
		return _ref2.apply(this, arguments);
	};
})();

let getDepartments = (() => {
	var _ref3 = _asyncToGenerator(function* (apiToken, queryParams = { per_page: 100, page: 0 }) {
		return axios.get('https://harvest.greenhouse.io/v1/departments', {
			// params: {},
			auth: {
				username: apiToken,
				password: ''
			}
		});
	});

	return function getDepartments(_x4) {
		return _ref3.apply(this, arguments);
	};
})();

/**
 * Gatsby requires ID to be a string to define nodes and greenhouse.io uses an integer instead.
 *
 * @param obj object.
 * @returns object.
 */


var _nodes = require('./nodes');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const crypto = require('crypto');
const axios = require('axios');
const changeId = obj => {
	const updatedObj = obj;
	updatedObj.id = updatedObj.id.toString();
	return updatedObj;
};

exports.sourceNodes = (() => {
	var _ref4 = _asyncToGenerator(function* ({ boundActionCreators }, { apiToken, queryParams }) {
		const createNode = boundActionCreators.createNode;


		return Promise.all([getDepartments(apiToken, { queryParams }).then(function (response) {
			return response.data;
		}), getJobPostings(apiToken, queryParams).then(function (response) {
			return response.data;
		})]).then(function ([departments, jobPostings]) {
			return Promise.all(departments.map((() => {
				var _ref5 = _asyncToGenerator(function* (department) {
					const convertedDepartment = changeId(department);
					const jobsForDepartmentResults = yield getJobsForDepartment(apiToken, { departmentId: convertedDepartment.id });
					const jobs = jobsForDepartmentResults.data.map(function (job) {
						return changeId(job);
					});

					var jobPostingsMapping = {};
					jobPostings.forEach(function (jobPosting) {
						jobPostingsMapping[jobPosting.job_id] = jobPosting;
					});

					var jobPostingsForDepartment = [];
					jobs.forEach(function (job) {
						const found = jobPostingsMapping[job.id];
						if (found) {
							jobPostingsForDepartment.push(found);
						}
					});
					convertedDepartment.jobPostings = jobPostingsForDepartment;
					const departmentNode = (0, _nodes.DepartmentNode)(changeId(convertedDepartment));

					jobPostingsForDepartment.forEach(function (jobPosting) {
						const convertedJobPosting = changeId(jobPosting);
						const jobPostingNode = (0, _nodes.JobPostingNode)(convertedJobPosting, {
							parent: departmentNode.id
						});
						createNode(jobPostingNode);
					});

					createNode(departmentNode);
				});

				return function (_x7) {
					return _ref5.apply(this, arguments);
				};
			})()));
		});
	});

	return function (_x5, _x6) {
		return _ref4.apply(this, arguments);
	};
})();