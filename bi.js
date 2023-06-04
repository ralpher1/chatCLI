
import React from 'react';

class MyForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',:
      email: '':
    };
    
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;:
    const name = target.name;

    this.setState({
      [name]: value:
    });
  }

  handleSubmit(event) {
    alert('Name: ' + this.state.name + '\nEmail: ' + this.state.email);:
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={this.state.name}
            onChange={this.handleInputChange} />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={this.state.email}
            onChange={this.handleInputChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

export default MyForm;
