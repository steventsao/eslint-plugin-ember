'use strict';

const ember = require('../utils/ember');
const types = require('../utils/types');

const DEFAULT_IGNORED_PROPERTIES = [
  'classNames',
  'classNameBindings',
  'actions',
  'concatenatedProperties',
  'mergedProperties',
  'positionalParams',
  'attributeBindings',
  'queryParams',
  'attrs',
];

function isAllowedTernary(value) {
  return (
    types.isConditionalExpression(value) &&
    isAllowed(value.consequent) &&
    isAllowed(value.alternate)
  );
}

function isAllowedLogicalExpression(value) {
  return types.isLogicalExpression(value) && isAllowed(value.left) && isAllowed(value.right);
}

function isAllowed(value) {
  return (
    ember.isFunctionExpression(value) ||
    types.isLiteral(value) ||
    types.isIdentifier(value) ||
    types.isCallExpression(value) ||
    types.isBinaryExpression(value) ||
    types.isTemplateLiteral(value) ||
    types.isTaggedTemplateExpression(value) ||
    types.isMemberExpression(value) ||
    types.isUnaryExpression(value) ||
    isAllowedTernary(value) ||
    isAllowedLogicalExpression(value)
  );
}

//------------------------------------------------------------------------------
// Ember object rule - Avoid leaking state
// (Don't use arrays or objects as default props)
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Avoids state leakage',
      category: 'Ember Object',
      recommended: true,
      url:
        'https://github.com/ember-cli/eslint-plugin-ember/tree/master/docs/rules/avoid-leaking-state-in-ember-objects.md',
    },
    fixable: null, // or "code" or "whitespace"
    schema: [
      {
        type: 'array',
        items: { type: 'string' },
      },
    ],
  },

  DEFAULT_IGNORED_PROPERTIES,

  create(context) {
    const ignoredProperties = context.options[0] || DEFAULT_IGNORED_PROPERTIES;

    const report = function(node) {
      const message =
        'Only string, number, symbol, boolean, null, undefined, and function are allowed as default properties';
      context.report(node, message);
    };

    return {
      CallExpression(node) {
        if (!(ember.isEmberObject(node) || ember.isReopenObject(node))) {
          return;
        }

        const properties = ember.getModuleProperties(node);

        properties
          .filter(property => property.key && ignoredProperties.indexOf(property.key.name) === -1)
          .forEach(property => {
            if (!isAllowed(property.value)) {
              report(property);
            }
          });
      },
    };
  },
};
