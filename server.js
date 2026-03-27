const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

app.post('/api/gdz', async (req, res) => {
    const { className, subject, textbook, taskNumber } = req.body;
    
    if (!className || !subject || !taskNumber) {
        return res.status(400).json({ 
            success: false, 
            error: 'Не все поля заполнены' 
        });
    }
    
    let prompt = `Ты — репетитор по школьным предметам. Дай подробное решение.

Класс: ${className}
Предмет: ${subject}`;
    
    if (textbook && textbook !== '') {
        prompt += `\nУчебник: ${textbook}`;
    }
    
    prompt += `\nНомер задания: ${taskNumber}

Формат ответа:
**Задание:** 
**Решение:** 
**Ответ:**`;

    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { 
                        role: 'system', 
                        content: 'Ты эксперт по домашним заданиям. Даешь точные и понятные решения.' 
                    },
                    { 
                        role: 'user', 
                        content: prompt 
                    }
                ],
                temperature: 0.3,
                max_tokens: 2000
            })
        });
        
        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            res.json({ success: true, answer: data.choices[0].message.content });
        } else {
            res.json({ success: false, error: 'Не удалось получить ответ от DeepSeek' });
        }
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
});

app.get('/', (req, res) => {
    res.json({ status: 'Сервер ГДЗ работает!' });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});