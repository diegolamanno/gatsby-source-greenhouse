import createNodeHelpers from 'gatsby-node-helpers'

const {
  createNodeFactory,
  generateNodeId,
  generateTypeName,
} = createNodeHelpers({
  typePrefix: `Greenhouse`,
})

const JOB_POSTING_TYPE = `JobPosting`
const DEPARTMENT_TYPE = `Department`

export const JobPostingNode = createNodeFactory(JOB_POSTING_TYPE)

export const DepartmentNode = createNodeFactory(DEPARTMENT_TYPE, node => {
  node.children = node.jobPostings.map(jobPosting => {
    return generateNodeId(JOB_POSTING_TYPE, jobPosting.id)
  })
  return node
})