'use strict';

const { getSourceModuleNameForIdentifier } = require('../utils/utils');
const { isObjectExpression } = require('../utils/types');

const ERROR_MESSAGE_NO_CLASSIC_CLASSES =
  'Native JS classes should be used instead of classic classes';

function hasNoArguments(node) {
  return node.arguments.length === 0;
}

function hasObjectArgument(node) {
  return node.arguments.some(isObjectExpression);
}

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  ERROR_MESSAGE_NO_CLASSIC_CLASSES,

  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow "classic" classes in favor of native JS classes',
      category: 'Ember Octane',
      recommended: false,
      octane: true,
      url:
        'https://github.com/ember-cli/eslint-plugin-ember/tree/master/docs/rules/no-classic-classes.md',
    },
    fixable: null, // or "code" or "whitespace"
  },

  create(context) {
    function reportNode(node) {
      context.report(node, ERROR_MESSAGE_NO_CLASSIC_CLASSES);
    }

    return {
      'CallExpression > MemberExpression[property.name="extend"]'(node) {
        const callExpression = node.parent;

        // Invalid if there are no arguments because that is equivalent to nnot called `extend` at all
        // Invalid with an object as an argument because that logic needsconversion to a native class
        // Still allows `.extend` if some other identifier is passed, like a Mixin
        if (hasNoArguments(callExpression) || hasObjectArgument(callExpression)) {
          const classImportedFrom = getSourceModuleNameForIdentifier(context, node.object);

          // Only warn about classes imported from the `@ember/` namespace
          if (classImportedFrom && classImportedFrom.startsWith('@ember/')) {
            reportNode(callExpression);
          }
        }
      },
    };
  },
};
