// Copyright 2021 LiYechao
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Box, Typography } from '@mui/material'

export default function ErrorView({ error }: { error?: Error }) {
  return (
    <Box>
      <Typography variant="h1" align="center" color="textSecondary">
        {error?.name || 'Error'}
      </Typography>

      <Typography variant="h6" align="center" color="textSecondary">
        {error?.message || 'Unknown Error'}
      </Typography>
    </Box>
  )
}
