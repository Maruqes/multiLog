package main

import (
	"bufio"
	"encoding/base64"
	"fmt"
	"net"
	"os"
	"os/exec"
	"strings"
	"time"
)

var messageChan = make(chan string)
var replyChan = make(chan string)

func execProgram() {
	to_exec := "/home/marques/projects/multiLog/src-tauri/target/release/bundle/appimage/multilog_0.1.0_amd64.AppImage"
	cmd := exec.Command(to_exec, "42850")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin
	err := cmd.Start()
	if err != nil {
		fmt.Println("Error starting command:", err)
	}
}

func checkIdentifier(identifier string) error {
	if strings.Contains(identifier, " ") {
		return fmt.Errorf("Identifier cannot contain spaces")
	}
	return nil
}

func add_tab(identifier string, content string) {
	err := checkIdentifier(identifier)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	contentb64 := base64.StdEncoding.EncodeToString([]byte(content))

	final_content := "add_tab " + identifier + " " + contentb64

	messageChan <- final_content
}

func add_content(identifier string, content string) {
	err := checkIdentifier(identifier)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	contentb64 := base64.StdEncoding.EncodeToString([]byte(content))

	final_content := "add_content " + identifier + " " + contentb64

	messageChan <- final_content
}

func remove_tab(identifier string) {
	err := checkIdentifier(identifier)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	final_content := "remove_tab " + identifier

	messageChan <- final_content
}

func main() {
	// execProgram()

	var conn net.Conn
	var err error
	for i := 0; i < 10; i++ { // Retry up to 5 times
		conn, err = net.Dial("tcp", "127.0.0.1:42850")
		if err == nil {
			break
		}
		fmt.Println("Waiting for server to start...")
		time.Sleep(500 * time.Millisecond)
	}

	if err != nil {
		fmt.Println("Error connecting:", err)
		return
	}
	defer conn.Close()

	fmt.Println("Connected to server at 127.0.0.1:42850")

	go func() {
		scanner := bufio.NewScanner(os.Stdin)
		for {
			fmt.Println("Enter text: ")
			if scanner.Scan() {
				text := scanner.Text()
				fmt.Println("You entered:", text)
				add_tab("test", text+"\n")
				add_content("test", text+"\n")
			} else {
				if err := scanner.Err(); err != nil {
					fmt.Println("Error reading input:", err)
				}
				break
			}
		}
	}()

	go func() {
		for {
			reply, err := bufio.NewReader(conn).ReadString('\n')
			if err != nil {
				fmt.Println("Error reading from server:", err)
				close(replyChan)
				return
			}
			replyChan <- reply
		}
	}()

	for {
		select {
		case message := <-messageChan:
			_, err := fmt.Fprintf(conn, message+"\n")
			if err != nil {
				fmt.Println("Error writing to server:", err)
				return
			}
		case reply, ok := <-replyChan:
			if !ok {
				return
			}
			fmt.Println("Server reply:", reply)
		}
	}

}
