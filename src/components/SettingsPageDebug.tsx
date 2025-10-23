import React from 'react';

const SettingsPageDebug = () => {
  console.log('SettingsPageDebug component is rendering!');

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'red',
      color: 'white',
      fontSize: '24px',
      fontWeight: 'bold',
      minHeight: '500px'
    }}>
      <h1>🚨 EMERGENCY DEBUG MODE 🚨</h1>
      <p>IF YOU CAN SEE THIS RED BOX, THE COMPONENT IS LOADING!</p>

      <div style={{
        backgroundColor: 'yellow',
        color: 'black',
        padding: '20px',
        margin: '20px 0',
        border: '5px solid black'
      }}>
        <h2>SIMPLE TEST BUTTON</h2>
        <button
          onClick={() => alert('BUTTON WORKS!')}
          style={{
            backgroundColor: 'blue',
            color: 'white',
            padding: '20px',
            fontSize: '20px',
            border: 'none',
            cursor: 'pointer',
            width: '100%'
          }}
        >
          CLICK ME - THIS SHOULD SHOW AN ALERT
        </button>
      </div>

      <div style={{
        backgroundColor: 'green',
        color: 'white',
        padding: '20px',
        margin: '20px 0'
      }}>
        <p>✅ Component loaded successfully</p>
        <p>✅ Inline styles working</p>
        <p>✅ If you see this, React is rendering</p>
      </div>
    </div>
  );
};

export default SettingsPageDebug;