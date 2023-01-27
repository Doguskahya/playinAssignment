let body = document.querySelector('body')
let container = document.querySelector('#container')
let cells = document.querySelectorAll('.cell')
let data = [];
let words = ['seat', 'eat', 'set', 'tea', 'east'];

function coordsToCellNo(X, Y) {
    return ((Y/50)*10) + (X/50)
}

function cellNoToX(cellNo) {
    return (cellNo%10) * 50
}

function cellNoToY(cellNo) {
    return Math.trunc(cellNo/10) * 50
}

function marginLeft(block) {
    return Number(block.style.marginLeft.split('px')[0])
}

function marginTop(block) {
    return Number(block.style.marginTop.split('px')[0])
}

function invertDirection(direction) {
    return direction == 'horizontal' ? 'vertical' : 'horizontal'
}

function blocks() {
    return document.querySelectorAll('.block')
}

function placeWords(){
    data = []
    blocks().forEach(block=> block.remove())
    cells.forEach(cell => cell.style.opacity = '1')
    placeFirstWord(words)
    let remaining = words.slice(1)
    
    for(let steps=1; steps<15; steps++){
        if(data.length===5){
            break
        }

        let placements=[]
        Array.from(remaining[0]).forEach((alphabet_A, index_A)=>{
            data.forEach((object)=>{
                Array.from(object.word).forEach((alphabet_B,index_B)=>{
                    if(alphabet_A===alphabet_B){
                        let intersectCellNo = object.occupied[index_B]
                        let direction = invertDirection(object.direction)
                        let firstAlphabetCellNo = direction=='horizontal' ? intersectCellNo-index_A : intersectCellNo-(index_A*10)
                        placements.push({word:remaining[0], direction, firstAlphabetCellNo})
                    }
                })
            })
        })

        let validPlacement = false;
        for(let i=0; i<placements.length; i++){
            let X = cellNoToX(placements[i].firstAlphabetCellNo)
            let Y = cellNoToY(placements[i].firstAlphabetCellNo)
            delete placements[i].firstAlphabetCellNo
            placements[i].occupied = placeWord(remaining[0], placements[i].direction, X, Y)

            let outOfGrid = false
            blocks().forEach((block)=>{
                if(marginLeft(block)<0 || marginLeft(block)>450 || marginTop(block)<0 || marginTop(block)>450){
                    outOfGrid=true
                }
            })

            let test = true
            if(!outOfGrid){
                let gridWords = getGridWords()
                gridWords.forEach((abc)=>{
                    if(!words.slice(0,data.length+1).includes(abc)){
                        test=false
                    }
                })

                if(new Set(gridWords).size!=gridWords.length || gridWords.length!=words.slice(0,data.length+1).length){
                    test=false
                }
            }

            if(test && !outOfGrid){
                validPlacement = true
                data.push(placements[i])
                remaining.shift()
                break
            }
            else{
                for(let j=0; j<remaining[0].length; j++){
                    container.lastChild.remove()
                }
            }
        }
        if(!validPlacement){
            words.push(words.splice(words.indexOf(remaining[0]),1)[0])
            remaining.push(remaining.shift())
        }
    }
    arrangeBlocks()
    cells.forEach((cell,cellNo)=>{
        if(!data.find(object => object.occupied.includes(cellNo))){
            cell.style.opacity = '0'
        }
    })
}

function arrangeBlocks(){
    let min_X = +Infinity
    let max_X = -Infinity
    let min_Y = +Infinity
    let max_Y = -Infinity

    blocks().forEach((block)=>{
        min_X = Math.min(min_X, marginLeft(block))
        max_X = Math.max(max_X, marginLeft(block))
        min_Y = Math.min(min_Y, marginTop(block))
        max_Y = Math.max(max_Y, marginTop(block))
    })

    let emptyColumnsOnLS = min_X/50
    let emptyColumnsOnRS = (450-max_X)/50

    data.forEach((object)=>{
        object.occupied = object.occupied.map(cellNo=> cellNo+Math.trunc((emptyColumnsOnRS-emptyColumnsOnLS)/2))
    })
    blocks().forEach((block)=>{
        block.style.marginLeft = `${marginLeft(block)+(Math.trunc((emptyColumnsOnRS-emptyColumnsOnLS)/2)*50)}px`
    })

    let emptyColumnsOnUS = min_Y/50
    let emptyColumnsOnBS = (450-max_Y)/50

    data.forEach((object)=>{
        object.occupied = object.occupied.map(cellNo=> cellNo+Math.trunc((emptyColumnsOnBS-emptyColumnsOnUS)/2))
    })
    blocks().forEach((block)=>{
        block.style.marginLeft = `${marginLeft(block)+(Math.trunc((emptyColumnsOnBS-emptyColumnsOnUS)/2)*50)}px`
    })

}

function placeFirstWord(){
    let z = (Math.floor(Math.random()*5))
    let X = 150
    let Y = 150
    let direction = ['horizontal','vertical'][Math.floor(Math.random()*2)]
    data.push({word:words[1], direction:direction, occupied: placeWord(words[0],direction,X,Y)})
}

function placeWord(word, direction, X, Y){
    let html = ''
    let occupied = []
    let cellNo = coordsToCellNo(X,Y)
    
    for(let i=0; i<word.length; i++){
        occupied.push(direction=='horizantal' ? cellNo+i : cellNo+(i*10))
        let style = `margin-left: ${direction==='horizontal' ? X+(i*50):X}px; margin-top: ${direction==='vertical' ? Y+(i*50):Y}px;`
        html += `<div class='block' style='${style}'>${word[i].toUpperCase()}</div>`
    }
    container.insertAdjacentHTML('beforeend', html)
    
    return occupied;
}

function getGridWords(){
    let gridWords = []
    for(let row=0; row<=9; row++){
        let newWord = ''
        for(column=0; column<=9; column++){
            if(getBlocksAtCellNo((row*10)+column).length){
                newWord = newWord + getBlocksAtCellNo((row*10)+column)[0].innerHTML
                if(newWord.length>1 && column===9){
                    gridWords.push(newWord.toLowerCase())
                }
            }
            else{
                newWord.length>1 && gridWords.push(newWord.toLowerCase())
                newWord = '';
            }
        }
    }

    for(let column=0; column<=9; column++){
        let newWord = ''
        for(row=0; row<=9; row++){
            if(getBlocksAtCellNo((row*10)+column).length){
                newWord = newWord + getBlocksAtCellNo((row*10)+column)[0].innerHTML
                if(newWord.length>1 && row===9){
                    gridWords.push(newWord.toLowerCase())
                }
            }
            else{
                newWord.length>1 && gridWords.push(newWord.toLowerCase())
                newWord = '';
            }
        }
    }
    return gridWords
}

function getBlocksAtCellNo(cellNo){
    let blocksFound = []
    blocks().forEach((block)=>{
        if(marginLeft(block)===cellNoToX(cellNo) && marginTop(block)===cellNoToY(cellNo)){
            blocksFound.push(block)
        }
    })
    return blocksFound
}