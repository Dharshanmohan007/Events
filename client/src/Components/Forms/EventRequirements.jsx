import React,{useState} from 'react'
import CustomSelect from '../CustomSelect'

export default function EventRequirements() {
    const [venue, setVenue] = useState("");
    const [audio, setAudio] = useState("");
    const [icts, setIcts] = useState("");
    const [transport, setTransport] = useState("");
    const [accommodation, setAccommodation] = useState("");
    const [media, setMedia] = useState("");
    const [other, setOther] = useState("");
  return (
    <div>
        <h1 className="text-white text-base sm:text-lg font-bold mb-6">
            Event Requirements
        </h1>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
            <CustomSelect
                label="Venue Required"
                required
                value={venue}
                onChange={setVenue}
                options={["Yes", "No"]}
            />
            <CustomSelect
                label="Audio Required"
                required
                value={audio}
                onChange={setAudio}
                options={["Yes", "No"]}
            />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
            <CustomSelect
                label="ICTS Required"
                required
                value={icts}
                onChange={setIcts}
                options={["Yes", "No"]}
            />
            <CustomSelect
                label="Transport Required"
                required
                value={transport}
                onChange={setTransport}
                options={["Yes", "No"]}
            />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
            <CustomSelect
                label="Accommodation/Dining Required"
                required
                value={accommodation}
                onChange={setAccommodation}
                options={["Yes", "No"]}
            />
            <CustomSelect
                label="Media Required"
                required
                value={media}
                onChange={setMedia}
                options={["Yes", "No"]}
            />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6'>
            <CustomSelect
                label="Other Requirements if any"
                required
                value={other}
                onChange={setOther}
                options={["Yes", "No"]}
            />
        </div>
    </div>
  )
}
