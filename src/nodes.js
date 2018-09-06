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

export const JobPostingNode = createNodeFactory(JOB_POSTING_TYPE, node => {
  console.log(`Created JobPostingNode with id ${node.id} and type ${node.type}`)
  return node
})


export const DepartmentNode = createNodeFactory(DEPARTMENT_TYPE, node => {
  console.log(`Created DepartmentNode with id ${node.id}`)
  node.children = node.jobPostings.map(jobPosting => {
    return generateNodeId(JOB_POSTING_TYPE, jobPosting.id)
  })
  return node
})