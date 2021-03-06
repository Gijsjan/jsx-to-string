var React = require('react');
var stringify = require('json-stringify-pretty-compact');

function isDefaultProp(defaultProps, key, value) {
  if (!defaultProps) {
    return false;
  }
  return defaultProps[key] === value;
}

function jsxToString(component, options) {

  let componentData = {
    name: component.type.displayName || component.type
  };

  let opts = Object.assign({
    spacing: 0,
    keyValueOverride: {},
    ignoreProps: []
  }, options);

  if (component.props) {
    componentData.props = Object.keys(component.props).map(
      (key) => {
        if (key === 'children' ||
          isDefaultProp(component.type.defaultProps, key, component.props[key]) ||
          opts.ignoreProps.includes(key)) {
          return '';
        } else {
          let value = component.props[key];
          if (typeof value === 'string') {
            return ` ${key}="${value}"`;
          } else if (React.isValidElement(value)) {
            value = jsxToString(value, opts);
          } else if (typeof value === 'object') {
            value = stringify(value);
          } else if (typeof value === 'function') {
            value = '...';
          }
          return ` ${key}={${opts.keyValueOverride[key] || value}}`
        }
      }
    ).join('');
  }

  if (component.props.children) {
    opts.spacing += 2;
    let indentation = new Array(opts.spacing + 1).join(' ');
    if (typeof component.props.children === 'string') {
      componentData.children = component.props.children;
    } else if (typeof component.props.children === 'object' &&
      !Array.isArray(component.props.children)) {
      componentData.children = jsxToString(component.props.children, opts);
    } else {
      componentData.children = component.props.children.map((child) => {
        if (typeof child === 'string') {
          return child;
        } else {
          return jsxToString(child, opts);
        }
      }).join(`\n${indentation}`);
    }
    return `<${componentData.name}${componentData.props}>\n${indentation}${componentData.children}\n${indentation.slice(0, -2)}</${componentData.name}>`;
  } else {
    return `<${componentData.name}${componentData.props} />`;
  }
};

export default jsxToString;
