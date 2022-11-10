export const INITIAL_STATE = {
    isPlaying: true,
    count: 4,
    bpm: 120,
    beatsPerMeasure: 4,
    
  }

export const metronomeReducer = (state, action) => {
    console.log("PAYLOAD", action.payload)
    switch (action.type) {
        case "CHANGE_INPUT":
            return{
                    ...state, [action.payload.name]: action.payload.value
                };
        // case "CHANGE_COUNT":
        //     return{
        //         ...state, count: action.payload.count
        //     };
        // case "CHANGE_BEATS":
        //     return{
        //         ...state, bpm: action.payload.bpm
        //     };
        case "PLAYING":
            return{
                ...state, isPlaying: action.payload.isPlaying
            };
        default: 
            return state
    }
}