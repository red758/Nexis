import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ userName: '', email: '', orgName: '' });

  // Fetch users when the page loads
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle typing in the input fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle clicking the submit button
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    try {
      await axios.post('http://localhost:5000/api/users/register', formData);
      alert("Success! User created.");
      setFormData({ userName: '', email: '', orgName: '' }); // Clear form
      fetchUsers(); // Refresh the list
    } catch (error) {
      alert("Error creating user.");
      console.error(error);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Nexis: Onboarding</h2>
      
      {/* The Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
        
        <input type="text" name="userName" placeholder="Your Name" value={formData.userName} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
        <input type="text" name="orgName" placeholder="Organization Name (e.g. Acme Corp)" value={formData.orgName} onChange={handleChange} required />
        
        <button type="submit" style={{ padding: '10px', backgroundColor: 'black', color: 'white', cursor: 'pointer' }}>
          Create Account
        </button>
      
      </form>

      {/* The List of Users */}
      <h3>Current Users</h3>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {users.map((user) => (
          <li key={user._id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
            <strong>{user.name}</strong> ({user.email}) <br />
            <span style={{ fontSize: '14px', color: 'gray' }}>
              Workspace: {user.organization ? user.organization.name : "None"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;