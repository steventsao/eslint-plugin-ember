'use strict';

const types = require('../utils/types');
const emberUtils = require('../utils/ember');

const ERROR_MESSAGE = 'Use `await` instead of `andThen` test wait helper.';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow use of `andThen` test wait helper.',
      category: 'Testing',
      recommended: false,
      url:
        'https://github.com/ember-cli/eslint-plugin-ember/tree/master/docs/rules/no-test-and-then.md',
    },
    fixable: null,
  },

  ERROR_MESSAGE,

  create(context) {
    if (!emberUtils.isTestFile(context.getFilename())) {
      return {};
    }

    return {
      CallExpression(node) {
        const callee = node.callee;
        if (types.isIdentifier(callee) && callee.name === 'andThen') {
          context.report({
            node,
            message: ERROR_MESSAGE,
          });
        }
      },
    };
  },
};
