var React = require('react');
var DefaultLayout = require('./layouts/default');

class Index extends React.Component {
  render() {
    return <DefaultLayout title="Felix Assistant" req={this.props.req}>Willkommen bei Felix</DefaultLayout>
  }
}

module.exports = Index;