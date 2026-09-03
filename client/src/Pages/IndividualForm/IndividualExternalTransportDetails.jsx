import { useEffect, useState } from 'react'
import ExternalTransportForm from '../../Components/Forms/ExternalTransportForm'
import { API_BASE } from '../../utils/apiConfig'

const IndividualExternalTransportDetails = () => {
  const [ticketingData, setTicketingData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadFacultyTickets = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/individual-ticketing/faculty`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        })
        if (!response.ok) throw new Error('Failed to load faculty ticketing details')

        const result = await response.json()
        const records =
          result?.data?.externalTransports ||
          result?.data?.tickets ||
          result?.externalTransports ||
          result?.tickets ||
          result?.data ||
          result
        setTicketingData(Array.isArray(records) ? records : [])
      } catch (error) {
        console.error('Failed to load faculty ticketing details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFacultyTickets()
  }, [])

  return (
    <div className="min-h-screen bg-[#16162A] p-6">
      {!isLoading && <ExternalTransportForm initialValues={ticketingData} />}
    </div>
  )
}

export { IndividualExternalTransportDetails }
export default IndividualExternalTransportDetails
