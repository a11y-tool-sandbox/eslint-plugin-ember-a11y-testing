module.exports = {
  meta: {
    type: "suggestion",

    docs: {
      description: "TODO",
      category: "Accessibility",
      recommended: true,
      url:
        "https://github.com/jgwhite/eslint-plugin-ember-a11y-testing/blob/master/lib/rules/a11y-audit.js"
    },
    fixable: "code",
    schema: [] // no options
  },

  create(context) {
    if (!context.getFilename().includes("tests/acceptance")) {
      return {};
    }

    return {
      CallExpression(node) {
        if (node.callee.name !== "test") {
          return;
        }

        if (context.getSourceCode().getText(node).includes('a11yAudit')) {
          return;
        }

        let message = "Acceptance tests must contain at least one call to a11yAudit()";

        context.report({ node, message });
      }
    };
  }
};
