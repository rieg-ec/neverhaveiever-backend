### EVENTS

*C: Client*
*O: Owner of room*
*S: Server*
*A: All*

**create_room** O-->S [ **create_room_success** **create_room_failure** ]

**join_room** C-->S [ **join_room_success** **join_room_failure**     **username_exists**]

**connected_users** S-->A

**remove_user** O-->S

**kicked** S-->C

**start_game** O-->S

**start_game** S-->A

**submit_statement** C-->S 

**users_without_statement** S-->A *users not ready for next statement*

**start_statements** S-->A

**new_statement** S-->A

**ready_for_next_statement** C-->S

**users_not_ready** S-->A
