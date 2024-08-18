'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState, useRef, useEffect } from 'react'
import ChatIcon from '@mui/icons-material/Chat'
import { TravelExplore } from '@mui/icons-material'

function TravelBot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm the GlobeGuide, a travel support assistant, specializing in travel assistance! How can I help you today? You can say Booking Assistance, Concierge Services, Customer Services!, or any other travel-related questions you may have!",
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true)
    setMessage('')

    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }

    setIsLoading(false)
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#e3f2fd"
    >
      <Box
        width="700px"
        height="85vh"
        borderRadius={16}
        overflow="hidden"
        boxShadow="0px 8px 30px rgba(0, 0, 0, 0.15)"
        display="flex"
        flexDirection="column"
        bgcolor="white"
      >
        {/* Header */}
        <Box
          bgcolor="#1565c0"
          color="white"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={2}
        >
          <TravelExplore fontSize="large" />
          <Typography variant="h5" ml={2}>
            GlobeGuide
          </Typography>
        </Box>

        {/* Chat Area */}
        <Stack
          direction="column"
          spacing={2}
          p={3}
          flexGrow={1}
          overflow="auto"
          sx={{ bgcolor: '#00274C' }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? '#bbdefb'
                    : '#64b5f6'
                }
                color="black"
                borderRadius={12}
                p={2}
                maxWidth="80%"
                sx={{
                  borderBottomLeftRadius: message.role === 'assistant' ? 0 : 12,
                  borderBottomRightRadius: message.role === 'user' ? 0 : 12,
                }}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>

        {/* Input Area */}
        <Stack direction="row" spacing={2} p={2} bgcolor="#e3f2fd">
          <TextField
            inputProps={{
              style: { color: "#000000" }
            }}
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            variant="outlined"
            placeholder="Type your travel queries here..."
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
            sx={{
              backgroundColor: '#1565c0',
              '&:hover': {
                backgroundColor: '#0d47a1',
              }
            }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

export default TravelBot;
