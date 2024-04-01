import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Grid, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

function UserList() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null); // State to store selected user for viewing answers
    const [openDialog, setOpenDialog] = useState(false); // State to control dialog visibility

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        fetch('http://127.0.0.1:5001/users/get')
            .then(response => response.json())
            .then(data => {
                setUsers(data);
            })
            .catch(error => {
                console.error('Error fetching users:', error);
            });
    };

    const deleteUser = (KID) => {
        fetch('http://127.0.0.1:5001/users/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ KID: KID }),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Refresh user list after deletion
            fetchUsers();
        })
        .catch(error => {
            console.error('Error deleting user:', error);
        });
    };

    const handleAddUser = () => {
        const PID = prompt("Enter PID (13 digits):");
        const name = prompt("Enter Name:");
    
        if (PID && PID.length === 13 && /^\d+$/.test(PID)) {
            fetch('http://127.0.0.1:5001/newuser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    PID: PID,
                    name: name,
                }),
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                // Refresh user list after adding user
                fetchUsers();
            })
            .catch(error => {
                console.error('Error adding user:', error);
            });
        } else {
            alert("Invalid PID. Please enter a 13-digit numeric PID.");
        }
    };

    const handleViewAnswers = (user) => {
        setSelectedUser(user);
        setOpenDialog(true);

        fetch(`http://127.0.0.1:5001/answers/${user.KID}`)
            .then(response => response.json())
            .then(data => {
                setSelectedUser(prevUser => ({
                    ...prevUser,
                    answers: data.answers
                }));
            })
            .catch(error => {
                console.error('Error fetching answers:', error);
            });
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedUser(null);
    };

    return (
        <>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>KID</TableCell>
                            <TableCell>PID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>SBP</TableCell>
                            <TableCell>DBP</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user._id}>
                                <TableCell>{user.KID}</TableCell>
                                <TableCell>{user.PID}</TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.date}</TableCell>
                                <TableCell>{user.time}</TableCell>
                                <TableCell>{user.SBP}</TableCell>
                                <TableCell>{user.DBP}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleViewAnswers(user)}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => deleteUser(user.KID)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Answers</DialogTitle>
                <DialogContent>
                    {selectedUser && (
                        <div>
                            <p><strong>KID:</strong> {selectedUser.KID}</p>
                            <p><strong>Name:</strong> {selectedUser.name}</p>
                            <p><strong>Answers:</strong></p>
                            <ul>
                                {selectedUser.answers && selectedUser.answers.map((answer, index) => (
                                    <li key={index}>
                                        AnswerNo: {answer.AnswerNo}, Message: {answer.Message}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">Close</Button>
                </DialogActions>
            </Dialog>
            <Grid container justifyContent="center" style={{ marginTop: '20px' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddUser}
                >
                    Add User
                </Button>
            </Grid>
        </>
    );
}

export default UserList;
