document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    const refreshBtn = document.getElementById('refreshData');
    const logoutBtn = document.getElementById('logoutBtn');
    const dataContent = document.getElementById('dataContent');

    // Проверка авторизации
    fetch('/profile')
        .then(response => {
            if (!response.ok) {
                window.location.href = '/';
            }
        });

    // Загрузка сохраненной темы
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
    }

    // Обработка переключения темы
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    });

    // Функция загрузки данных
    const loadData = async () => {
        try {
            const response = await fetch('/data');
            const data = await response.json();
            
            dataContent.innerHTML = `
                <p>Время последнего обновления: ${new Date(data.timestamp).toLocaleString()}</p>
                <p>Значение: ${data.value.toFixed(4)}</p>
            `;
        } catch (error) {
            dataContent.innerHTML = '<p>Ошибка при загрузке данных</p>';
        }
    };

    // Загрузка данных при открытии страницы
    loadData();

    // Обработка кнопки обновления данных
    refreshBtn.addEventListener('click', loadData);

    // Обработка выхода из системы
    logoutBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/logout', {
                method: 'POST'
            });

            if (response.ok) {
                window.location.href = '/';
            }
        } catch (error) {
            alert('Ошибка при выходе из системы');
        }
    });
}); 