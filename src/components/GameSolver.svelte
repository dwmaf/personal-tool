<script>
  // Pakai Runes Svelte 5 buat State yang reaktif
  let grid = $state(Array(8).fill(0).map(() => Array(8).fill(0)));

  // Fungsi toggle buat kamu "niru" kondisi di HP ke Web
  function toggleCell(r, c) {
    grid[r][c] = grid[r][c] === 0 ? 1 : 0;
  }

  function resetGrid() {
    grid = Array(8).fill(0).map(() => Array(8).fill(0));
  }

  // Definisi master bentuk balok (1 = isi, 0 = kosong)
  const masterShapes = {
    'I2': [[1, 1]],
    'I3': [[1, 1, 1]],
    'I4': [[1, 1, 1, 1]],
    'I5': [[1, 1, 1, 1, 1]],
    'L3-Normal': [[1, 1, 1], [1, 0, 0], [1, 0, 0]],
    'L3-Small': [[1, 1], [1, 0]],
    'L4': [[1, 1, 1], [0, 0, 1]],
    'L5': [[1, 1, 1], [1, 0, 0]],
    'Box2': [[1, 1], [1, 1]],
    'Box23': [[1, 1], [1, 1], [1, 1]],
    'Box3': [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
    'T': [[1, 1, 1], [0, 1, 0]],
    'Z': [[1, 1, 0], [0, 1, 1]],
    'S': [[0, 1, 1], [1, 1, 0]],
    'diag2': [[1, 0], [0, 1]],
    'diag3': [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  };

  // 3 Slot balok yang tersedia di game
  let selectedBlocks = $state([
    { shape: masterShapes['I3'], rotation: 0 },
    { shape: masterShapes['Box2'], rotation: 0 },
    { shape: masterShapes['L3-Normal'], rotation: 0 }
  ]);

  // Logic Solver
  let suggestedMoves = $state([]);
  let isSolving = $state(false);
  let currentStep = $state(-1);

  function canPlace(board, shape, r, c) {
    const rows = shape.length;
    const cols = shape[0].length;
    if (r + rows > 8 || c + cols > 8) return false;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (shape[i][j] === 1 && board[r + i][c + j] === 1) return false;
      }
    }
    return true;
  }

  function placeAndClear(board, shape, r, c) {
    let newBoard = board.map(row => [...row]);
    const rows = shape.length;
    const cols = shape[0].length;
    
    // Place
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (shape[i][j] === 1) newBoard[r + i][c + j] = 1;
      }
    }
    
    // Check lines
    let rowsToClear = [];
    let colsToClear = [];
    for (let i = 0; i < 8; i++) {
        if (newBoard[i].every(cell => cell === 1)) rowsToClear.push(i);
        let colFull = true;
        for (let j = 0; j < 8; j++) {
            if (newBoard[j][i] === 0) {
                colFull = false;
                break;
            }
        }
        if (colFull) colsToClear.push(i);
    }
    
    const linesCleared = rowsToClear.length + colsToClear.length;
    
    // Clear
    for (let rIdx of rowsToClear) newBoard[rIdx] = Array(8).fill(0);
    for (let cIdx of colsToClear) {
        for (let i = 0; i < 8; i++) newBoard[i][cIdx] = 0;
    }
    
    return { board: newBoard, linesCleared };
  }

  function calculateScore(board, moves) {
    let emptyCells = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c] === 0) emptyCells++;
      }
    }
    const totalLines = moves.reduce((sum, m) => sum + m.linesCleared, 0);
    return (moves.length * 2000) + (totalLines * 500) + emptyCells;
  }

  function solveRecursive(board, blocks, moves) {
    if (blocks.length === 0) {
      return { moves, score: calculateScore(board, moves) };
    }

    let bestResult = null;

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      const remaining = [...blocks.slice(0, i), ...blocks.slice(i + 1)];
      
      const bRows = block.shape.length;
      const bCols = block.shape[0].length;

      for (let r = 0; r <= 8 - bRows; r++) {
        for (let c = 0; c <= 8 - bCols; c++) {
          if (canPlace(board, block.shape, r, c)) {
            const { board: nextBoard, linesCleared } = placeAndClear(board, block.shape, r, c);
            const result = solveRecursive(nextBoard, remaining, [...moves, { 
              blockIndex: block.index, 
              r, c, 
              shape: block.shape,
              linesCleared 
            }]);
            
            if (result && (!bestResult || result.score > bestResult.score)) {
              bestResult = result;
            }
          }
        }
      }
    }
    return bestResult;
  }

  function solveNextMove() {
    isSolving = true;
    suggestedMoves = [];
    currentStep = -1;
    
    setTimeout(() => {
      const blocksWithIndex = selectedBlocks.map((b, i) => ({ ...b, index: i }));
      const result = solveRecursive(grid, blocksWithIndex, []);
      
      if (result && result.moves.length === selectedBlocks.length) {
        suggestedMoves = result.moves;
        currentStep = 0;
      } else {
        alert("Waduh, gak ada jalan buat ketiga balok ini! Coba hapus bbrp sel di papan.");
      }
      isSolving = false;
    }, 50);
  }

  function applyMove(stepIndex) {
    const move = suggestedMoves[stepIndex];
    if (!move) return;
    const { board } = placeAndClear(grid, move.shape, move.r, move.c);
    grid = board;
    currentStep++;
    if (currentStep >= suggestedMoves.length) {
      suggestedMoves = [];
      currentStep = -1;
    }
  }

  // Fungsi Putar Matrix 90 derajat
  function rotateBlock(index) {
    const matrix = selectedBlocks[index].shape;
    selectedBlocks[index].shape = matrix[0].map((_, colIndex) => 
      matrix.map(row => row[colIndex]).reverse()
    );
  }

  function changeShape(index, type) {
    selectedBlocks[index].shape = masterShapes[type];
  }

  function isHighlighted(r, c) {
    if (currentStep < 0 || !suggestedMoves[currentStep]) return false;
    const move = suggestedMoves[currentStep];
    const dr = r - move.r;
    const dc = c - move.c;
    return dr >= 0 && dr < move.shape.length && 
           dc >= 0 && dc < move.shape[0].length && 
           move.shape[dr][dc] === 1;
  }
</script>

<section class="flex flex-col md:flex-row items-center md:items-start justify-center gap-8 p-8 bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-slate-700/50 shadow-2xl text-slate-100 font-sans">
  
  <!-- Left Side: Blocks Selection -->
  <div class="flex flex-col gap-3 w-56 bg-slate-900/50 p-4 rounded-2xl border border-slate-800 backdrop-blur-xl shadow-2xl">
    <div class="flex items-center gap-2 mb-1">
      <div class="w-1.5 h-6 bg-yellow-400 rounded-full"></div>
      <h2 class="text-lg font-black text-white italic tracking-wider">BLOCKS</h2>
    </div>
    
    {#each selectedBlocks as block, i}
      <div class="p-2.5 bg-slate-800/40 rounded-xl border border-slate-700/50 flex flex-col items-center gap-2.5 hover:border-yellow-500/30 transition-colors">
        <div class="h-16 flex items-center justify-center">
            <div class="grid gap-0.5" style="grid-template-columns: repeat({block.shape[0].length}, 1fr)">
            {#each block.shape as row}
                {#each row as cell}
                <div class="w-3.5 h-3.5 {cell ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-[0_0_8px_rgba(234,179,8,0.2)]' : 'bg-transparent'} rounded-sm"></div>
                {/each}
            {/each}
            </div>
        </div>

        <div class="flex gap-1.5 w-full">
          <select 
            onchange={(e) => changeShape(i, e.currentTarget.value)}
            class="bg-slate-700 text-[10px] font-bold p-1.5 rounded-lg flex-1 outline-none border border-slate-600 focus:border-yellow-500 transition-all appearance-none"
          >
            {#each Object.keys(masterShapes) as type}
              <option value={type}>{type}</option>
            {/each}
          </select>
          
          <button 
            onclick={() => rotateBlock(i)}
            class="w-7 h-7 flex items-center justify-center bg-slate-700 hover:bg-blue-600 rounded-lg transition-all border border-slate-600 text-xs"
          >
            🔄
          </button>
        </div>
      </div>
    {/each}
  </div>

  <!-- Center: Board -->
  <div class="flex flex-col items-center gap-4">
    <div class="text-center">
        <h1 class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 italic tracking-tighter">BLOCK BLAST</h1>
        <p class="text-slate-600 font-bold tracking-[0.2em] text-[10px] -mt-1">SOLVER PRO v2.1 (COMPACT)</p>
    </div>
    
    <div class="relative bg-slate-800 p-2 rounded-[1.5rem] shadow-[0_0_40px_rgba(0,0,0,0.5)] border-4 border-slate-800/50">
      <div class="grid grid-cols-8 gap-1 bg-slate-900 p-1.5 rounded-xl">
        {#each grid as row, r}
          {#each row as cell, c}
            <button 
              onclick={() => toggleCell(r, c)}
              class="w-10 h-10 rounded-md transition-all relative overflow-hidden group
                {cell === 1 ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)]' : 'bg-slate-800/50 hover:bg-slate-700'}
                {isHighlighted(r, c) ? 'ring-2 ring-yellow-400 ring-inset z-10 scale-105 shadow-[0_0_15px_rgba(250,204,21,0.4)]' : ''}"
            >
                {#if isHighlighted(r, c)}
                    <div class="absolute inset-0 bg-yellow-400/20 animate-pulse"></div>
                {/if}
            </button>
          {/each}
        {/each}
      </div>

      {#if suggestedMoves.length > 0}
        <div class="absolute -right-16 top-1/2 -translate-y-1/2 flex flex-col gap-2">
            {#each suggestedMoves as _, idx}
                <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black border 
                    {idx === currentStep ? 'bg-yellow-400 text-slate-950 border-white scale-110' : 'bg-slate-800 text-slate-600 border-slate-700 opacity-40'} shadow-lg transition-all">
                    {idx + 1}
                </div>
            {/each}
        </div>
      {/if}
    </div>

    <div class="flex flex-col gap-3 w-full max-w-xs">
      {#if suggestedMoves.length > 0}
        <button 
            onclick={() => applyMove(currentStep)}
            class="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-950 rounded-xl font-black text-sm shadow-[0_4px_0_#9a3412] hover:translate-y-[1px] hover:shadow-[0_3px_0_#9a3412] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2"
        >
            PLACE BLOCK {currentStep + 1} 
            <span class="text-[10px] px-1.5 py-0.5 bg-white/20 rounded-md">Step {currentStep + 1}/3</span>
        </button>
      {:else}
        <div class="grid grid-cols-2 gap-3">
            <button onclick={resetGrid} class="px-4 py-3 bg-slate-800 text-slate-400 font-bold text-xs rounded-xl border border-slate-700 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/40 transition-all uppercase tracking-widest">
                RESET
            </button>
            <button 
                onclick={solveNextMove}
                disabled={isSolving}
                class="px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-black text-white text-xs shadow-[0_4px_0_#1e3a8a] hover:translate-y-[1px] hover:shadow-[0_3px_0_#1e3a8a] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 uppercase tracking-widest"
            >
                {isSolving ? '...' : 'SOLVE'}
            </button>
        </div>
      {/if}
      
      {#if suggestedMoves.length > 0}
        <button onclick={() => suggestedMoves = []} class="text-slate-600 text-xs font-bold hover:text-white transition-all underline underline-offset-4 mx-auto">
            Cancel Suggestion
        </button>
      {/if}
    </div>
  </div>

</section>

<style lang="postcss">
  @reference "tailwindcss";
  :global(html) {
    background-color: theme(--color-gray-100);
  }
</style>