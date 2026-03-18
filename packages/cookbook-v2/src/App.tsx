import React from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { ExamplesPage } from './pages/ExamplesPage'
import { ExampleDetailPage } from './pages/ExampleDetailPage'

// Force full remount when navigating between examples
// so controls/state reset cleanly
function ExampleDetailPageKeyed() {
  const { id } = useParams<{ id: string }>()
  return <ExampleDetailPage key={id} />
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/examples" element={<ExamplesPage />} />
        <Route path="/examples/:id" element={<ExampleDetailPageKeyed />} />
      </Routes>
    </Layout>
  )
}

export default App


