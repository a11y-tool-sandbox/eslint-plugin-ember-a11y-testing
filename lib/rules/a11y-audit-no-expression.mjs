import * as utils from "../utils.mjs";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const rule = {
  meta: {
    type: "problem",
    fixable: "code",
    docs: {
      description: "enforce a11yAudit must be called as a function",
      category: "Accessibility",
      recommended: true,
      url: "https://github.com/a11y-tool-sandbox/eslint-plugin-ember-a11y-testing/blob/master/lib/rules/a11y-audit-no-expression.js",
    },
    schema: [],
    messages: {
      a11yAuditMustBeCalled: "a11yAudit must be called as a function",
    },
  },

  create(context) {
    const settings = utils.extractSettings(context);

    function isAuditIdentifier(node, importDecl) {
      if (!importDecl) {
        // If no import declaration, check if it's the default a11yAudit name
        return node.name === utils.DEFAULT_A11Y_AUDIT_VARIABLE;
      }
      // Check both the local name and if it's named 'audit'
      return (
        node.name === importDecl.local.name ||
        node.name === "audit" ||
        (importDecl.imported && node.name === importDecl.imported.name)
      );
    }

    function shouldReport(node) {
      if (node.parent.type === "ImportDefaultSpecifier") return false;
      if (node.parent.type === "ImportSpecifier") return false;
      if (node.parent.type === "CallExpression" && node.parent.callee === node)
        return false;
      if (
        node.parent.type === "VariableDeclarator" &&
        node.parent.init === node
      )
        return false;
      if (
        node.parent.type === "AwaitExpression" &&
        node.parent.parent.type === "CallExpression"
      )
        return false;
      return true;
    }

    return {
      Identifier(node) {
        const a11yImportDeclaration = utils.findA11yAuditImportDeclaration(
          context,
          settings,
        );

        // Find any import named 'audit' from any module
        const auditImport = context
          .getSourceCode()
          .ast.body.find(
            (node) =>
              node.type === "ImportDeclaration" &&
              node.specifiers.some(
                (spec) =>
                  spec.type === "ImportSpecifier" &&
                  (spec.imported.name === "audit" ||
                    spec.local.name === "audit"),
              ),
          );

        if (
          !isAuditIdentifier(node, a11yImportDeclaration) &&
          !(auditImport && node.name === "audit")
        )
          return;
        if (!shouldReport(node)) return;

        const parentFn = utils.findParentOfType(node, /Function/);
        const isAsync = parentFn && parentFn.async;
        const isAwaitExpression = node.parent.type === "AwaitExpression";
        const prefix = isAsync && !isAwaitExpression ? "await " : "";

        context.report({
          node: isAwaitExpression ? node.parent : node,
          messageId: "a11yAuditMustBeCalled",
          fix(fixer) {
            if (isAwaitExpression) {
              return fixer.replaceText(node.parent, `await ${node.name}()`);
            }
            return fixer.replaceText(node, `${prefix}${node.name}()`);
          },
        });
      },
    };
  },
};

export default rule;
