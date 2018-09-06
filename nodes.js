'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DepartmentNode = exports.JobPostingNode = undefined;

var _gatsbyNodeHelpers = require('gatsby-node-helpers');

var _gatsbyNodeHelpers2 = _interopRequireDefault(_gatsbyNodeHelpers);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _createNodeHelpers = (0, _gatsbyNodeHelpers2.default)({
  typePrefix: `Greenhouse`
});

const createNodeFactory = _createNodeHelpers.createNodeFactory,
      generateNodeId = _createNodeHelpers.generateNodeId,
      generateTypeName = _createNodeHelpers.generateTypeName;


const JOB_POSTING_TYPE = `JobPosting`;
const DEPARTMENT_TYPE = `Department`;

const JobPostingNode = exports.JobPostingNode = createNodeFactory(JOB_POSTING_TYPE, node => {
  console.log(`Created JobPostingNode with id ${node.id} and type ${node.type}`);
  return node;
});

const DepartmentNode = exports.DepartmentNode = createNodeFactory(DEPARTMENT_TYPE, node => {
  console.log(`Created DepartmentNode with id ${node.id}`);
  node.children = node.jobPostings.map(jobPosting => {
    return generateNodeId(JOB_POSTING_TYPE, jobPosting.id);
  });
  return node;
});