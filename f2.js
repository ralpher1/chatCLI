
import React from 'react';
import MyComponent from './MyComponent';

class MyApp extends React.Component {
  render() {
    return (
      <div>
        <MyComponent title="Hello, World!" text="This is some text." />
      </div>
    );
  }
}

export default MyApp;
