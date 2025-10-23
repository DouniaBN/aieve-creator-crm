// Super simple component with no imports
const SuperSimpleTest = () => {
  return (
    <div>
      <h1>SUPER SIMPLE TEST</h1>
      <p>If you can see this, React is working!</p>
      <button onClick={() => window.alert('Alert works!')}>
        Test Button
      </button>
    </div>
  );
};

export default SuperSimpleTest;