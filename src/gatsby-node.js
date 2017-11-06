const crypto = require('crypto')
const axios = require('axios')

/**
 * Greenhouse promise request.
 * @param apiToken string.
 * @param queryParams object.
 */
const getJobs = (apiToken, queryParams = { live: true }) =>
	axios.get('https://harvest.greenhouse.io/v1/job_posts', {
		params: queryParams,
		auth: {
			username: apiToken,
			password: '',
		},
	})

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

	const result = await getJobs(apiToken, queryParams)
	const jobs = result.data

	jobs.forEach(job => {
		const jsonString = JSON.stringify(job)
		const gatsbyNode = {
			...changeId(job),
			children: [],
			parent: '__SOURCE__',
			internal: {
				type: 'GreenhouseJob',
				content: jsonString,
				contentDigest: crypto
					.createHash('md5')
					.update(jsonString)
					.digest('hex'),
			},
		}
		createNode(gatsbyNode)
	})
}
