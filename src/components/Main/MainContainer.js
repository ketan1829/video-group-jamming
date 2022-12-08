<MainContainer>
<Row>
  <Label htmlFor="roomName">Room Name</Label>
  <Input type="text" id="roomName" ref={roomRef} />
</Row>
<Row>
  <Label htmlFor="userName">User Name</Label>
  <Input type="text" id="userName" ref={userRef} />
</Row>
<JoinButton onClick={clickJoin}> Join </JoinButton>
{err ? <Error>{errMsg}</Error> : null}
</MainContainer>