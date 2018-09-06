const crypto = require('crypto')
const axios = require('axios')
import { JobPostingNode, DepartmentNode } from './nodes'

/**
 * Greenhouse promise request.
 * @param apiToken string.
 * @param queryParams object.
 */
async function getJobsForDepartment(apiToken, queryParams) {
	return axios.get('https://harvest.greenhouse.io/v1/jobs', {
		params: {
			department_id: queryParams.departmentId,
			status: 'open'
		},
		auth: {
			username: apiToken,
			password: '',
		},
	})
}

/**
 * Greenhouse promise request.
 * @param apiToken string.
 * @param queryParams object.
 */
async function getJobPostings(apiToken, queryParams = { live: true }) {
	return axios.get('https://harvest.greenhouse.io/v1/job_posts', {
		params: queryParams,
		auth: {
			username: apiToken,
			password: '',
		},
	})
}

async function getDepartments(apiToken, queryParams = {per_page: 100, page: 0}) {
	return axios.get('https://harvest.greenhouse.io/v1/departments', {
		auth: {
			username: apiToken,
			password: '',
		}
	})
}

/**
 * Gatsby requires ID to be a string to define nodes and greenhouse.io uses an integer instead.
 *
 * @param obj object.
 * @returns object.
 */
const changeId = obj => {
	const updatedObj = obj
	updatedObj.id = updatedObj.id.toString()
	return updatedObj
}




exports.sourceNodes = async ({ boundActionCreators }, { apiToken, queryParams }) => {
	const { createNode } = boundActionCreators

	
	return Promise.all([
			getDepartments(apiToken, {queryParams}).then(response => response.data),
			getJobPostings(apiToken, queryParams).then(response => response.data)
		]).then(([departments, jobPostings]) => {
			return Promise.all(
				departments.map(async department => {
					const convertedDepartment = changeId(department)
					const jobsForDepartmentResults = await getJobsForDepartment(apiToken, {departmentId: convertedDepartment.id})
					const jobs = jobsForDepartmentResults.data.map(job => changeId(job))

					var jobPostingsMapping = {}
					jobPostings.forEach(jobPosting => {
						jobPostingsMapping[jobPosting.job_id] = jobPosting
					})

					var jobPostingsForDepartment = []
					jobs.forEach(job => {
						const found = jobPostingsMapping[job.id]
						if(found) {
							jobPostingsForDepartment.push(found)
						}
					})
					convertedDepartment.jobPostings =  jobPostingsForDepartment
					const departmentNode = DepartmentNode(changeId(convertedDepartment))

					jobPostingsForDepartment.forEach(jobPosting => {
						const convertedJobPosting = changeId(jobPosting)
						const jobPostingNode = JobPostingNode(convertedJobPosting, { 
							parent: departmentNode.id 
						})
						createNode(jobPostingNode)
					})
					
					createNode(departmentNode)
				})
			)
		})
}
