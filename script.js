class BilliardsAnalytics {
    constructor() {
        this.gameState = {
            currentPlayer: 1,
            gameStartTime: null,
            lastActionTime: null,
            isPaused: false,
            gameId: Date.now()
        };

        this.players = {
            1: {
                shots: 0,
                fouls: 0,
                breaks: 0,
                currentBreak: 0,
                totalTime: 0,
                shotTimes: [],
                longestBreak: 0,
                fastestShot: null,
                slowestShot: null
            },
            2: {
                shots: 0,
                fouls: 0,
                breaks: 0,
                currentBreak: 0,
                totalTime: 0,
                shotTimes: [],
                longestBreak: 0,
                fastestShot: null,
                slowestShot: null
            }
        };

        this.gameHistory = [];
        this.chart = null;
        this.timerInterval = null;

        this.initializeEventListeners();
        this.initializeChart();
        this.startGame();
    }

    initializeEventListeners() {
        // Action buttons
        document.getElementById('shotBtn').addEventListener('click', () => this.handleShot());
        document.getElementById('switchBtn').addEventListener('click', () => this.handleSwitch());
        document.getElementById('foulBtn').addEventListener('click', () => this.handleFoul());

        // Control buttons
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('statsBtn').addEventListener('click', () => this.showDetailedStats());

        // Modal close
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('statsModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('statsModal')) {
                this.closeModal();
            }
        });

        // Prevent context menu on mobile
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    startGame() {
        this.gameState.gameStartTime = Date.now();
        this.gameState.lastActionTime = Date.now();
        this.updateDisplay();
        this.startTimer();
        this.addToActivityLog('Game started - Player 1 begins');
    }

    newGame() {
        clearInterval(this.timerInterval);
        
        // Reset game state
        this.gameState = {
            currentPlayer: 1,
            gameStartTime: Date.now(),
            lastActionTime: Date.now(),
            isPaused: false,
            gameId: Date.now()
        };

        // Reset player stats
        this.players = {
            1: {
                shots: 0,
                fouls: 0,
                breaks: 0,
                currentBreak: 0,
                totalTime: 0,
                shotTimes: [],
                longestBreak: 0,
                fastestShot: null,
                slowestShot: null
            },
            2: {
                shots: 0,
                fouls: 0,
                breaks: 0,
                currentBreak: 0,
                totalTime: 0,
                shotTimes: [],
                longestBreak: 0,
                fastestShot: null,
                slowestShot: null
            }
        };

        this.gameHistory = [];
        this.clearActivityLog();
        this.updateDisplay();
        this.updateChart();
        this.startTimer();
        this.addToActivityLog('New game started - Player 1 begins');
    }

    handleShot() {
        if (this.gameState.isPaused) return;

        const currentTime = Date.now();
        const timeSinceLastAction = currentTime - this.gameState.lastActionTime;
        
        // Record the shot
        this.recordAction('shot', this.gameState.currentPlayer, timeSinceLastAction);
        
        const player = this.players[this.gameState.currentPlayer];
        player.shots++;
        player.currentBreak++;
        player.totalTime += timeSinceLastAction;
        player.shotTimes.push(timeSinceLastAction);
        
        // Update fastest/slowest shot times
        if (!player.fastestShot || timeSinceLastAction < player.fastestShot) {
            player.fastestShot = timeSinceLastAction;
        }
        if (!player.slowestShot || timeSinceLastAction > player.slowestShot) {
            player.slowestShot = timeSinceLastAction;
        }

        this.gameState.lastActionTime = currentTime;
        
        this.addToActivityLog(`Player ${this.gameState.currentPlayer} potted a ball (${this.formatTime(timeSinceLastAction)})`);
        this.updateDisplay();
        this.updateChart();
    }

    handleSwitch() {
        if (this.gameState.isPaused) return;

        const currentTime = Date.now();
        const timeSinceLastAction = currentTime - this.gameState.lastActionTime;
        
        // End current player's break
        this.endBreak(this.gameState.currentPlayer);
        
        // Record the miss
        this.recordAction('switch', this.gameState.currentPlayer, timeSinceLastAction);
        
        const player = this.players[this.gameState.currentPlayer];
        player.totalTime += timeSinceLastAction;
        
        this.addToActivityLog(`Player ${this.gameState.currentPlayer} missed - turn switches (${this.formatTime(timeSinceLastAction)})`);
        
        // Switch players
        this.gameState.currentPlayer = this.gameState.currentPlayer === 1 ? 2 : 1;
        this.gameState.lastActionTime = currentTime;
        
        this.updateDisplay();
        this.updateChart();
    }

    handleFoul() {
        if (this.gameState.isPaused) return;

        const currentTime = Date.now();
        const timeSinceLastAction = currentTime - this.gameState.lastActionTime;
        
        // End current player's break
        this.endBreak(this.gameState.currentPlayer);
        
        // Record the foul
        this.recordAction('foul', this.gameState.currentPlayer, timeSinceLastAction);
        
        const player = this.players[this.gameState.currentPlayer];
        player.fouls++;
        player.totalTime += timeSinceLastAction;
        
        this.addToActivityLog(`Player ${this.gameState.currentPlayer} committed a foul (${this.formatTime(timeSinceLastAction)})`);
        
        // Switch players
        this.gameState.currentPlayer = this.gameState.currentPlayer === 1 ? 2 : 1;
        this.gameState.lastActionTime = currentTime;
        
        this.updateDisplay();
        this.updateChart();
    }

    endBreak(playerId) {
        const player = this.players[playerId];
        if (player.currentBreak > 0) {
            player.breaks++;
            if (player.currentBreak > player.longestBreak) {
                player.longestBreak = player.currentBreak;
            }
            this.addToActivityLog(`Player ${playerId} finished break of ${player.currentBreak} balls`);
            player.currentBreak = 0;
        }
    }

    recordAction(action, player, time) {
        this.gameHistory.push({
            timestamp: Date.now(),
            action: action,
            player: player,
            time: time,
            gameTime: Date.now() - this.gameState.gameStartTime
        });
    }

    togglePause() {
        this.gameState.isPaused = !this.gameState.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (this.gameState.isPaused) {
            clearInterval(this.timerInterval);
            pauseBtn.textContent = 'Resume';
            this.addToActivityLog('Game paused');
        } else {
            this.gameState.lastActionTime = Date.now();
            this.startTimer();
            pauseBtn.textContent = 'Pause';
            this.addToActivityLog('Game resumed');
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.gameState.isPaused) {
                this.updateTimer();
            }
        }, 1000);
    }

    updateTimer() {
        const currentTime = Date.now() - this.gameState.lastActionTime;
        document.getElementById('currentTime').textContent = this.formatTime(currentTime);
    }

    updateDisplay() {
        // Update current player
        document.getElementById('currentPlayer').textContent = this.gameState.currentPlayer;
        
        // Update player stats highlights
        document.getElementById('player1Stats').classList.toggle('active', this.gameState.currentPlayer === 1);
        document.getElementById('player2Stats').classList.toggle('active', this.gameState.currentPlayer === 2);
        
        // Update player 1 stats
        const p1 = this.players[1];
        document.getElementById('p1Shots').textContent = p1.shots;
        document.getElementById('p1AvgTime').textContent = this.formatTime(p1.shots > 0 ? p1.totalTime / p1.shots : 0);
        document.getElementById('p1Breaks').textContent = p1.breaks;
        document.getElementById('p1Fouls').textContent = p1.fouls;
        
        // Update player 2 stats
        const p2 = this.players[2];
        document.getElementById('p2Shots').textContent = p2.shots;
        document.getElementById('p2AvgTime').textContent = this.formatTime(p2.shots > 0 ? p2.totalTime / p2.shots : 0);
        document.getElementById('p2Breaks').textContent = p2.breaks;
        document.getElementById('p2Fouls').textContent = p2.fouls;
    }

    initializeChart() {
        const canvas = document.getElementById('analyticsChart');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = canvas.offsetWidth * 2;
        canvas.height = 150 * 2;
        ctx.scale(2, 2);
        
        this.chart = {
            canvas: canvas,
            ctx: ctx,
            width: canvas.offsetWidth,
            height: 150
        };
        
        this.updateChart();
    }

    updateChart() {
        const ctx = this.chart.ctx;
        const width = this.chart.width;
        const height = this.chart.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        if (this.gameHistory.length === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No data yet', width / 2, height / 2);
            return;
        }
        
        // Get last 20 actions
        const recentActions = this.gameHistory.slice(-20);
        const maxTime = Math.max(...recentActions.map(action => action.time));
        const padding = 20;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        // Draw axes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        
        // Draw data points
        recentActions.forEach((action, index) => {
            const x = padding + (index / (recentActions.length - 1 || 1)) * chartWidth;
            const y = height - padding - (action.time / maxTime) * chartHeight;
            
            // Choose color based on player and action
            let color = action.player === 1 ? '#4ade80' : '#f59e0b';
            if (action.action === 'foul') color = '#ef4444';
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw line to next point
            if (index < recentActions.length - 1) {
                const nextAction = recentActions[index + 1];
                const nextX = padding + ((index + 1) / (recentActions.length - 1)) * chartWidth;
                const nextY = height - padding - (nextAction.time / maxTime) * chartHeight;
                
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(nextX, nextY);
                ctx.stroke();
            }
        });
        
        // Draw legend
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#4ade80';
        ctx.fillText('● Player 1', 5, 15);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('● Player 2', 70, 15);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('● Foul', 135, 15);
    }

    showDetailedStats() {
        const modal = document.getElementById('statsModal');
        const detailedStats = document.getElementById('detailedStats');
        
        const p1 = this.players[1];
        const p2 = this.players[2];
        
        const statsHTML = `
            <div class="detailed-stats">
                <h3>Game Summary</h3>
                <p><strong>Total Game Time:</strong> ${this.formatTime(Date.now() - this.gameState.gameStartTime)}</p>
                <p><strong>Total Actions:</strong> ${this.gameHistory.length}</p>
                
                <h3>Player Comparison</h3>
                <div class="stats-grid">
                    <div class="stat-category">
                        <h4>Shots</h4>
                        <p>Player 1: ${p1.shots}</p>
                        <p>Player 2: ${p2.shots}</p>
                        <p><strong>Leader:</strong> ${p1.shots > p2.shots ? 'Player 1' : p2.shots > p1.shots ? 'Player 2' : 'Tie'}</p>
                    </div>
                    
                    <div class="stat-category">
                        <h4>Average Shot Time</h4>
                        <p>Player 1: ${this.formatTime(p1.shots > 0 ? p1.totalTime / p1.shots : 0)}</p>
                        <p>Player 2: ${this.formatTime(p2.shots > 0 ? p2.totalTime / p2.shots : 0)}</p>
                        <p><strong>Faster:</strong> ${this.getFasterPlayer()}</p>
                    </div>
                    
                    <div class="stat-category">
                        <h4>Breaks</h4>
                        <p>Player 1: ${p1.breaks} (longest: ${p1.longestBreak})</p>
                        <p>Player 2: ${p2.breaks} (longest: ${p2.longestBreak})</p>
                        <p><strong>Better:</strong> ${p1.longestBreak > p2.longestBreak ? 'Player 1' : p2.longestBreak > p1.longestBreak ? 'Player 2' : 'Tie'}</p>
                    </div>
                    
                    <div class="stat-category">
                        <h4>Consistency</h4>
                        <p>Player 1 fastest: ${p1.fastestShot ? this.formatTime(p1.fastestShot) : 'N/A'}</p>
                        <p>Player 1 slowest: ${p1.slowestShot ? this.formatTime(p1.slowestShot) : 'N/A'}</p>
                        <p>Player 2 fastest: ${p2.fastestShot ? this.formatTime(p2.fastestShot) : 'N/A'}</p>
                        <p>Player 2 slowest: ${p2.slowestShot ? this.formatTime(p2.slowestShot) : 'N/A'}</p>
                    </div>
                    
                    <div class="stat-category">
                        <h4>Fouls</h4>
                        <p>Player 1: ${p1.fouls}</p>
                        <p>Player 2: ${p2.fouls}</p>
                        <p><strong>Cleaner play:</strong> ${p1.fouls < p2.fouls ? 'Player 1' : p2.fouls < p1.fouls ? 'Player 2' : 'Tie'}</p>
                    </div>
                    
                    <div class="stat-category">
                        <h4>Performance Metrics</h4>
                        <p>Player 1 efficiency: ${this.calculateEfficiency(1).toFixed(1)}%</p>
                        <p>Player 2 efficiency: ${this.calculateEfficiency(2).toFixed(1)}%</p>
                        <p><strong>More efficient:</strong> ${this.getMoreEfficientPlayer()}</p>
                    </div>
                </div>
                
                <h3>Recent Actions</h3>
                <div class="recent-actions">
                    ${this.gameHistory.slice(-10).reverse().map(action => 
                        `<div class="action-detail">
                            <span class="action-time">${this.formatTime(action.time)}</span>
                            <span class="action-player">Player ${action.player}</span>
                            <span class="action-type">${action.action}</span>
                        </div>`
                    ).join('')}
                </div>
            </div>
        `;
        
        detailedStats.innerHTML = statsHTML;
        modal.style.display = 'block';
    }

    getFasterPlayer() {
        const p1Avg = this.players[1].shots > 0 ? this.players[1].totalTime / this.players[1].shots : Infinity;
        const p2Avg = this.players[2].shots > 0 ? this.players[2].totalTime / this.players[2].shots : Infinity;
        
        if (p1Avg < p2Avg) return 'Player 1';
        if (p2Avg < p1Avg) return 'Player 2';
        return 'Tie';
    }

    getMoreEfficientPlayer() {
        const p1Eff = this.calculateEfficiency(1);
        const p2Eff = this.calculateEfficiency(2);
        
        if (p1Eff > p2Eff) return 'Player 1';
        if (p2Eff > p1Eff) return 'Player 2';
        return 'Tie';
    }

    calculateEfficiency(playerId) {
        const player = this.players[playerId];
        const totalActions = player.shots + player.fouls;
        if (totalActions === 0) return 0;
        return (player.shots / totalActions) * 100;
    }

    closeModal() {
        document.getElementById('statsModal').style.display = 'none';
    }

    addToActivityLog(message) {
        const feed = document.getElementById('activityFeed');
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        
        feed.appendChild(item);
        feed.scrollTop = feed.scrollHeight;
        
        // Limit to last 50 items
        while (feed.children.length > 50) {
            feed.removeChild(feed.firstChild);
        }
    }

    clearActivityLog() {
        const feed = document.getElementById('activityFeed');
        feed.innerHTML = '<div class="activity-item">Game started</div>';
    }

    formatTime(milliseconds) {
        const seconds = milliseconds / 1000;
        if (seconds < 60) {
            return `${seconds.toFixed(1)}s`;
        } else {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BilliardsAnalytics();
});

// Add CSS for detailed stats
const additionalCSS = `
    .detailed-stats {
        color: #ffffff;
    }
    
    .stats-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 15px;
        margin: 20px 0;
    }
    
    .stat-category {
        background: rgba(255, 255, 255, 0.1);
        padding: 15px;
        border-radius: 10px;
    }
    
    .stat-category h4 {
        color: #4ade80;
        margin-bottom: 10px;
        font-size: 16px;
    }
    
    .stat-category p {
        margin: 5px 0;
        font-size: 14px;
    }
    
    .recent-actions {
        max-height: 200px;
        overflow-y: auto;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 10px;
        padding: 10px;
    }
    
    .action-detail {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        font-size: 12px;
    }
    
    .action-detail:last-child {
        border-bottom: none;
    }
    
    .action-time {
        font-weight: 600;
        color: #4ade80;
    }
    
    .action-player {
        color: #f59e0b;
    }
    
    .action-type {
        text-transform: uppercase;
        font-weight: 600;
    }
`;

// Inject additional CSS
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);