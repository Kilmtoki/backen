import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Grid } from '@mui/material';

function QuestionList() {
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = () => {
        fetch('http://127.0.0.1:5001/question/get')
            .then(response => response.json())
            .then(data => {
                setQuestions(data);
            })
            .catch(error => {
                console.error('Error fetching questions:', error);
            });
    };

    const deleteQuestion = (QuestionsNo) => {
        fetch('http://127.0.0.1:5001/question/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ QuestionsNo: QuestionsNo }),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            // Refresh question list after deletion
            fetchQuestions();
        })
        .catch(error => {
            console.error('Error deleting question:', error);
        });
    };

    const editQuestion = (QuestionsNo, currentMessage) => {
        const updatedMessage = prompt("Edit Message:", currentMessage);
        if (updatedMessage !== null) {
            fetch('http://127.0.0.1:5001/question/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    QuestionsNo: QuestionsNo,
                    Message: updatedMessage,
                }),
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                // Refresh question list after editing question
                fetchQuestions();
            })
            .catch(error => {
                console.error('Error editing question:', error);
            });
        }
    };

    const handleAddQuestion = () => {
        const QuestionsNo = prompt("Enter Question Number:");
        const Message = prompt("Enter Message:");
    
        if (QuestionsNo && /^\d+$/.test(QuestionsNo)) {
            // Check if the entered Question Number already exists
            const questionExists = questions.some(question => question.QuestionsNo === parseInt(QuestionsNo));
            if (questionExists) {
                alert("Question Number already exists. Please enter a different number.");
                return;
            }
    
            fetch('http://127.0.0.1:5001/question/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    QuestionsNo: QuestionsNo,
                    Message: Message,
                }),
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                // Refresh question list after adding question
                fetchQuestions();
            })
            .catch(error => {
                console.error('Error adding question:', error);
            });
        } else {
            alert("Invalid Question Number. Please enter a numeric value.");
        }
    };
    

    return (
        <>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Question Number</TableCell>
                            <TableCell>Message</TableCell>
                            <TableCell>Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {questions.map(question => (
                            <TableRow key={question._id}>
                                <TableCell>{question.QuestionsNo}</TableCell>
                                <TableCell>{question.Message}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => editQuestion(question.QuestionsNo, question.Message)}
                                        style={{ marginRight: '10px' }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => deleteQuestion(question.QuestionsNo)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Grid container justifyContent="center" style={{ marginTop: '20px' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddQuestion}
                >
                    Add Question
                </Button>
            </Grid>
        </>
    );
}

export default QuestionList;
